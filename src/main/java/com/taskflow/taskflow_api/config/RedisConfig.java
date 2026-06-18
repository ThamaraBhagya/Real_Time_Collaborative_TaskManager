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

        return JsonMapper.builder().build();
    }
    @Bean
    public RedisTemplate<String, Object> boardEventRedisTemplate(
            RedisConnectionFactory factory,
            JsonMapper redisObjectMapper) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);


        GenericJacksonJsonRedisSerializer serializer =
                new GenericJacksonJsonRedisSerializer(redisObjectMapper);


        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);


        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);


        template.afterPropertiesSet();

        return template;
    }


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