#!/usr/bin/env python3
"""Servidor local do protótipo, sem cache.

O http.server padrão do Python responde com Last-Modified e deixa o
navegador decidir se reaproveita o que já tem. Durante o desenvolvimento
isso é veneno: você troca o arquivo, recarrega, e vê a versão velha.

Aqui toda resposta sai com no-store, que é a instrução mais forte
possível: não guarde nem por um segundo. Custa nada — o arquivo está no
disco, ao lado.

Só escuta em 127.0.0.1. Nada sai do computador.
"""

import http.server
import socketserver
import sys
import os


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_response(self, *args, **kwargs):
        # Sem 304: o navegador sempre recebe o arquivo inteiro, novo.
        super().send_response(*args, **kwargs)

    def log_message(self, *args):
        pass  # silencia o log; a janela do Terminal fecha logo em seguida


class Servidor(socketserver.TCPServer):
    allow_reuse_address = True   # reabrir na mesma porta sem esperar o TIME_WAIT
    daemon_threads = True


if __name__ == "__main__":
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    pasta = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
    os.chdir(pasta)
    with Servidor(("127.0.0.1", porta), SemCache) as s:
        s.serve_forever()
