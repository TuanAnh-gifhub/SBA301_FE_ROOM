package org.rent.room.be.config;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Kích hoạt một "broker" đơn giản để gửi tin nhắn ngược lại cho client
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefix cho các request từ client gửi lên (ví dụ: /app/chat)
        registry.setApplicationDestinationPrefixes("/app");
        // Prefix cho các tin nhắn cá nhân
        registry.setUserDestinationPrefix("/user");
    }
}

