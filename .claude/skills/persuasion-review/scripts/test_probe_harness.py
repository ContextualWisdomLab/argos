"""Regression tests for the UX probe readiness boundary."""

import unittest
import urllib.request
from unittest import mock

from probe_harness import (
    _LoopbackRedirectHandler,
    _validated_loopback_http_url,
    spawn_and_wait_ready,
    wait_http_ready,
)


class ValidatedLoopbackHttpUrlTests(unittest.TestCase):
    def test_accepts_loopback_http_urls(self) -> None:
        urls = (
            "http://127.0.0.1:3000/",
            "https://localhost/ready",
            "http://[::1]:8080/health",
        )

        for url in urls:
            with self.subTest(url=url):
                self.assertEqual(_validated_loopback_http_url(url), url)

    def test_rejects_non_http_or_non_loopback_targets(self) -> None:
        urls = (
            "file:///etc/passwd",
            "https://example.com/ready",
            "http://127.0.0.2:3000/",
            "http://user:password@localhost:3000/",
            "http://localhost:99999/",
        )

        for url in urls:
            with self.subTest(url=url):
                with self.assertRaises(ValueError):
                    _validated_loopback_http_url(url)

    def test_rejects_redirects_that_leave_loopback(self) -> None:
        handler = _LoopbackRedirectHandler()

        with self.assertRaises(ValueError):
            handler.redirect_request(
                None,
                None,
                302,
                "Found",
                {},
                "https://example.com/ready",
            )

    def test_accepts_relative_redirects_resolved_against_loopback(self) -> None:
        handler = _LoopbackRedirectHandler()
        request = urllib.request.Request("https://127.0.0.1:3000/start")

        redirected = handler.redirect_request(
            request,
            None,
            302,
            "Found",
            {},
            "/ready",
        )

        self.assertIsNotNone(redirected)
        self.assertEqual(redirected.full_url, "https://127.0.0.1:3000/ready")

    def test_rejects_relative_redirects_resolved_off_loopback(self) -> None:
        handler = _LoopbackRedirectHandler()
        request = urllib.request.Request("https://127.0.0.1:3000/start")

        with self.assertRaises(ValueError):
            handler.redirect_request(
                request,
                None,
                302,
                "Found",
                {},
                "//example.com/ready",
            )

    def test_direct_loopback_validation_without_source_request_is_safe(self) -> None:
        handler = _LoopbackRedirectHandler()

        redirected = handler.redirect_request(
            None,
            None,
            302,
            "Found",
            {},
            "https://localhost/ready",
        )

        self.assertIsNone(redirected)

    def test_malformed_readiness_url_returns_false(self) -> None:
        self.assertFalse(wait_http_ready("https://example.com/ready", 0.01))

    @mock.patch("probe_harness._terminate")
    @mock.patch("probe_harness.subprocess.Popen")
    def test_invalid_readiness_url_terminates_spawned_process(
        self,
        popen: mock.Mock,
        terminate: mock.Mock,
    ) -> None:
        process = popen.return_value

        with self.assertRaisesRegex(RuntimeError, "server did not become ready"):
            spawn_and_wait_ready(
                ["server"],
                env={},
                cwd=".",
                ready_url="https://example.com/ready",
            )

        terminate.assert_called_once_with(process)


if __name__ == "__main__":
    unittest.main()
