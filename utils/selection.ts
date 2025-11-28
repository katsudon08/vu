import { GenreScore } from "@/types/genre";

export const selectGenre = (genreScores: GenreScore[]): GenreScore => {
    const random = Math.random()

    let cumulativeProbability = 0

    for (const genreScore of genreScores) {
        cumulativeProbability += genreScore.value

        if (random < cumulativeProbability) return genreScore
    }

    return genreScores[genreScores.length - 1]
}