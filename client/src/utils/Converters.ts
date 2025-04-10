// Типы для комментариев
export interface ApiComment {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    type: string;
    title: string;
    content: string;
    user_id: number;
    markdown_file_id: number;
    position_x: number;
    position_y: number;
}

export interface ClientComment {
    id?: number;
    type: string;
    title: string;
    content: string;
    position: { x: number; y: number };
    createdAt?: string;
    userId?: number;
    fileId?: number;
}

// Функции преобразования
export const apiToClientComment = (apiComment: ApiComment): ClientComment => ({
    type: apiComment.type,
    title: apiComment.title,
    content: apiComment.content,
    position: {
        x: apiComment.position_x,
        y: apiComment.position_y
    },
    id: apiComment.ID,
    createdAt: apiComment.CreatedAt,
    userId: apiComment.user_id,
    fileId: apiComment.markdown_file_id
});

export const clientToApiComment = (clientComment: ClientComment): Partial<ApiComment> => ({
    type: clientComment.type,
    title: clientComment.title,
    content: clientComment.content,
    position_x: Math.floor(clientComment.position.x),
    position_y: Math.floor(clientComment.position.y),
    ...(clientComment.id && { ID: clientComment.id }),
    ...(clientComment.userId && { user_id: clientComment.userId }),
    ...(clientComment.fileId && { markdown_file_id: clientComment.fileId })
});
