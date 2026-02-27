package org.rent.room.be.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration cho real-time notifications
 *
 * Flow:
 * 1. Client connect tới /ws-notifications
 * 2. Client subscribe tới /user/{userId}/queue/notifications
 * 3. Server gửi message tới user cụ thể
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple message broker để gửi message tới clients
        // /queue - cho point-to-point messaging (user-specific)
        // /topic - cho broadcast messaging (tất cả users)
        config.enableSimpleBroker("/queue", "/topic");

        // Prefix cho messages từ client gửi lên server
        config.setApplicationDestinationPrefixes("/app");

        // Prefix cho user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để clients kết nối WebSocket
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns("*") // Cho phép tất cả origins (trong production nên specify cụ thể)
                .withSockJS(); // Fallback cho browsers không support WebSocket
    }
}

/*
 * USAGE EXAMPLE:
 *
 * Frontend connection:
 *
 * const socket = new SockJS('http://localhost:8080/ws-notifications');
 * const stompClient = Stomp.over(socket);
 *
 * stompClient.connect({}, (frame) => {
 *     console.log('Connected: ' + frame);
 *
 *     // Subscribe to personal notifications
 *     stompClient.subscribe('/user/{userId}/queue/notifications', (message) => {
 *         const notification = JSON.parse(message.body);
 *         console.log('New notification:', notification);
 *     });
 *
 *     // Subscribe to unread count updates
 *     stompClient.subscribe('/user/{userId}/queue/unread-count', (message) => {
 *         const data = JSON.parse(message.body);
 *         console.log('Unread count:', data.count);
 *     });
 * });
 */
