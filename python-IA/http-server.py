#coding:utf-8
import http.server

port = 600
address = ("", port)

server = http.server.HTTPServer

handler = http.server.CGIHTTPRequestHandler
handler.cgi_directories = ["/"]

httpd = server(address, handler)

print(f"serveur démarré sur le port {port}")
httpd.serve_forever()
