package dev.emoforge.diary.dto.music;

import dev.emoforge.diary.domain.MusicRecommendSong;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class MusicRecommendSongDTO {
    private String title;
    private String artist;
    private String youtubeUrl;
    private String thumbnailUrl;

    public static MusicRecommendSongDTO fromEntity(MusicRecommendSong song) {
        return MusicRecommendSongDTO.builder()
                .title(song.getSongTitle())
                .artist(song.getArtistName())
                .youtubeUrl(song.getYoutubeUrl())
                .thumbnailUrl(song.getThumbnailUrl())
                .build();
    }
}
