# integration tests

Currently, there aren't integration tests so to speak, but some work has been started on interoperability. This
directory contains some simple utilities for testing cross communication between platforms using an echo service. Note
that due to limitations in the current implementation, certain combinations of languages are not possible.
The list below denotes which client languages can talk to which server languages (where `client --> server`).

- [x] `go --> go`
- [x] `go --> node`
- [x] `node --> node`
- [ ] `node --> go`
