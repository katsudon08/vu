export type GenreType = 'RELAX' | 'MOVE' | 'CREATIVE' | 'MUSIC'

export type GenreScore = {
    key: GenreType,
    value: number, // 選好度
}