#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
    if (argc != 2)
    {
        printf("Usage: %s port\n", argv[0]);
        exit(1);
    }
    printf("Welcome! This is a UDP server, I can only received message from client and reply with same message\n");
    
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(atoi(argv[1]));
    addr.sin_addr.s_addr = htonl(INADDR_ANY);

    int sock;
    if ( (sock = socket(AF_INET, SOCK_DGRAM, 0)) < 0)
    {
        perror("socket");
        exit(1);
    }
    if (bind(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0)
    {
        perror("bind");
        exit(1);
    }
    char buff[512];
    struct sockaddr_in clientAddr;
    int n;
    int len = sizeof(clientAddr);
    while (1)
    {
        n = recvfrom(sock, buff, 511, 0, (struct sockaddr*)&clientAddr, &len);
        if (n>0)
        {
            buff[n] = 0;
            static char buf[128] = {0};
            char* caddr = inet_ntop(AF_INET, &clientAddr, buf, sizeof(buf));
            int cport = ntohs(clientAddr.sin_port);
            printf("%s %d says: %s\n", caddr, cport, buff);
            n = sendto(sock, buff, n, 0, (struct sockaddr *)&clientAddr, sizeof(clientAddr));
            if (n < 0)
            {
                perror("sendto");
                break;
            }
        }
        else if (n<0)
        {
            perror("recv");
            break;
        } else {
          printf("peer shutdown\n");
        }
    }
    return 0;
}
