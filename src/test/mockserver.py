# Copyright 2021 RTBHOUSE. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be found in the LICENSE file.

import http.server
import threading
import ssl
import logging
import json
from dataclasses import dataclass

from urllib.parse import parse_qs
from functools import partial

logger = logging.getLogger(__file__)


class RequestHandler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, directory, callback_function, **kwargs):
        self.callback_function = callback_function
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self) -> None:
        self.send_header('X-Allow-FLEDGE', 'true')
        return super().end_headers()

    def address_string(self):
        return f'{self.client_address[0]} -> :{self.server.server_port}'

    def do_GET(self):
        params = {}
        path = self.path
        if '?' in path:
            path, tmp = path.split('?', 1)
            params = parse_qs(tmp)
        self.callback_function(Request(path, params))
        super().do_GET()


@dataclass(init=True, repr=True, eq=False, frozen=True)
class Request:
    path: str
    params: map

    def get_params(self, key):
        return self.params[key]

    def get_first_param(self, key):
        return self.get_params(key)[0]

    def get_first_json_param(self, key):
        return json.loads(self.get_first_param(key))


class MockServer:
    def __init__(self, port, directory):
        self.server_name = 'https://fledge-tests.creativecdn.net'
        self.server_port = port
        self.server_directory = directory
        self.http_server = None
        self.requests = []

    @property
    def address(self):
        return f'{self.server_name}:{self.server_port}'

    @property
    def directory(self):
        return self.server_directory

    def __enter__(self):
        logger.info(f"server {self.address} starting")
        server_address = ('0.0.0.0', self.server_port)
        self.http_server = http.server.HTTPServer(
            server_address,
            partial(RequestHandler, directory=self.directory, callback_function=self.requests.append))
        self.http_server.socket = ssl.wrap_socket(
            self.http_server.socket,
            server_side=True,
            certfile='test/ssl/fledge-tests.creativecdn.net.crt',
            keyfile='test/ssl/fledge-tests.creativecdn.net.key',
            ssl_version=ssl.PROTOCOL_TLS)
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()
        return self

    def run(self):
        self.http_server.serve_forever()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.http_server.shutdown()
        logger.info(f"server {self.address} stopped")

    def get_requests(self):
        return self.requests

    def get_first_request(self, path):
        for request in self.get_requests():
            if request.path == path:
                return request
