"""Regression tests for the UX probe readiness boundary."""

import unittest

from probe_harness import _LoopbackRedirectHandler, _validated_loopback_http_url


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


if __name__ == "__main__":
    unittest.main()
