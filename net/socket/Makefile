all: udp_server udp_client udp_server_ex udp_server_ex2

udp_server:
	g++ -std=c++11 -pthread udp_server.cc -I ../../ -o udp_server.exe

udp_server_ex:
	g++ -std=c++11 -pthread udp_server_ex.cc -I ../../ -o udp_server_ex.exe

udp_server_ex2:
	g++ -std=c++11 -pthread udp_server_ex2.cc -I ../../ -o udp_server_ex2.exe

udp_client:
	g++ -std=c++11 -pthread udp_client.cc -I ../../ -o udp_client.exe

clean:
	rm -f *.exe *.o
