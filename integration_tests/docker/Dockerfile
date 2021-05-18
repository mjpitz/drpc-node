FROM ubuntu:21.04

ARG GO_VERSION=1.16.4
ARG PROTOC_VERSION=3.15.7

RUN apt-get update -y && apt-get install -y curl unzip

RUN curl -sSLo go.tar.gz https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -zxf go.tar.gz && \
    rm go.tar.gz

RUN curl -sSLo protoc.zip https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-x86_64.zip && \
    unzip -d /usr/local/protoc protoc.zip && \
    rm protoc.zip

ENV PATH="/usr/local/go/bin:/usr/local/protoc/bin:${PATH}"

ENV GO111MODULE=on

RUN GOBIN=/usr/local/bin go get \
    github.com/bufbuild/buf/cmd/buf@v0.41.0 \
    google.golang.org/protobuf/cmd/protoc-gen-go@v1.26.0 \
    storj.io/drpc/cmd/protoc-gen-go-drpc@v0.0.21
