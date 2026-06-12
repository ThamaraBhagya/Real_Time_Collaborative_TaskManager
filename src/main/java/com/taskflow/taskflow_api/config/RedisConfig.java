// src/main/java/com/taskflow/config/RedisConfig.java
package com.taskflow.taskflow_api.config;

import tools.jackson.databind.json.JsonMapper;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import com.taskflow.taskflow_api.websocket.BoardEvent;
import com.taskflow.taskflow_api.websocket.BoardEventSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    public static final String BOARD_CHANNEL_PREFIX = "board:";

    @Bean
    public JsonMapper redisObjectMapper() {
        // Jackson 3 has Date/Time support built-in and configured perfectly by default!
        return JsonMapper.builder().build();
    }
    @Bean
    public RedisTemplate<String, Object> boardEventRedisTemplate(
            RedisConnectionFactory factory,
            JsonMapper redisObjectMapper) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // 1. Use the new Jackson 3 Serializer (No "2" in the name)
        GenericJacksonJsonRedisSerializer serializer =
                new GenericJacksonJsonRedisSerializer(redisObjectMapper);

        // 2. Setup standard keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);

        // 3. Setup hash keys (from your old code - very safe practice!)
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

        // 4. Initialize it properly (from your old code)
        template.afterPropertiesSet();

        return template;
    }

    // Listens to ALL board:* channels and routes to BoardEventSubscriber
    @Bean
    public RedisMessageListenerContainer redisListenerContainer(
            RedisConnectionFactory factory,
            MessageListenerAdapter listenerAdapter) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        container.addMessageListener(listenerAdapter,
                new PatternTopic(BOARD_CHANNEL_PREFIX + "*"));
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(BoardEventSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }
}