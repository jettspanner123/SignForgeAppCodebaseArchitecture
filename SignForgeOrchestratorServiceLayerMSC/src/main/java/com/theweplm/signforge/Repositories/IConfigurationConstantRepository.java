package com.theweplm.signforge.Repositories;

import com.theweplm.signforge.Models.Classes.ConfigurationConstantEntityClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IConfigurationConstantRepository extends JpaRepository<ConfigurationConstantEntityClass, UUID> {

    Optional<ConfigurationConstantEntityClass> findByConfigurationKeyIgnoreCase(String configurationKey);

    Optional<ConfigurationConstantEntityClass> findByConfigurationKeyIgnoreCaseAndIsActiveTrue(String configurationKey);

    List<ConfigurationConstantEntityClass> findAllByIsActiveTrue();

    boolean existsByConfigurationKeyIgnoreCase(String configurationKey);
}
