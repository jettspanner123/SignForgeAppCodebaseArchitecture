package com.theweplm.signforge.Repositories;

import com.theweplm.signforge.Models.Classes.UserEntityClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository extends JpaRepository<UserEntityClass, UUID> {

    Optional<UserEntityClass> findByEmailIgnoreCase(String email);

    Optional<UserEntityClass> findByRefreshToken(String refreshToken);

    boolean existsByEmailIgnoreCase(String email);
}
