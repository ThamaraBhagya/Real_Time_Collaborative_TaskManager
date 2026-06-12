package com.taskflow.taskflow_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class TaskflowApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskflowApiApplication.class, args);
	}

}
