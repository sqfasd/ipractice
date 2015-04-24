all: udp_server udp_client

udp_server:
	g++ -std=c++11 -pthread udp_server.cc -I ../../ -o udp_server.exe

udp_client:
	g++ -std=c++11 -pthread udp_client.cc -I ../../ -o udp_client.exe

clean:
	rm -f *.exe *.o
