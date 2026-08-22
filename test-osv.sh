curl -sSfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b ./.local/bin v0.50.0
./.local/bin/trivy fs . --scanners vuln
