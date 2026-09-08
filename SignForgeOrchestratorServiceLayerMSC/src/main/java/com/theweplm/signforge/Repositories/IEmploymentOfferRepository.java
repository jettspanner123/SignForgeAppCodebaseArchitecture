package com.theweplm.signforge.Repositories;

import com.theweplm.signforge.Models.Classes.EmploymentOfferEntityClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IEmploymentOfferRepository extends JpaRepository<EmploymentOfferEntityClass, UUID> {

    List<EmploymentOfferEntityClass> findAllByStatusNotOrderByCreatedAtDesc(String status);

    List<EmploymentOfferEntityClass> findAllByOrderByCreatedAtDesc();

    Optional<EmploymentOfferEntityClass> findByOfferCode(String offerCode);

    Optional<EmploymentOfferEntityClass> findByDocumentHash(String documentHash);
}
