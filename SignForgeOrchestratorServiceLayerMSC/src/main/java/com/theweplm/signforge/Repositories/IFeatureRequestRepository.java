package com.theweplm.signforge.Repositories;

import com.theweplm.signforge.Models.Classes.FeatureRequestEntityClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IFeatureRequestRepository extends JpaRepository<FeatureRequestEntityClass, UUID> {

    List<FeatureRequestEntityClass> findAllByOrderByCreatedAtDesc();

    List<FeatureRequestEntityClass> findByRequesterUserIdOrderByCreatedAtDesc(UUID requesterUserId);

    List<FeatureRequestEntityClass> findByTargetUserIdOrderByCreatedAtDesc(UUID targetUserId);
}
