all: udp_server udp_client

udp_server:
	g++ -std=c++11 -pthread udp_server.cc -I ../../ -o udp_server

udp_client:
	g++ -std=c++11 -pthread udp_client.cc -I ../../ -o udp_client

clean:
	rm -f udp_server udp_client *.o
