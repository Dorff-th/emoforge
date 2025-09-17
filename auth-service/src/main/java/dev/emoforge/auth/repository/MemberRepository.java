package dev.emoforge.auth.repository;

import dev.emoforge.auth.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);

    //카카오 id 로 사용자 찾기
    Optional<Member> findByKakaoId(Long kakaoId);
}
