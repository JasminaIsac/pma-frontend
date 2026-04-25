import { Platform } from 'react-native';
import apiClient from './client';
import { MessageAttachment } from 'schemas';

export interface UploadAttachmentResponse {
  attachmentId: string;
  url: string;
  type: MessageAttachment['type'];
  filename: string;
  mimeType: string;
  size: number;
}

export const uploadAttachment = async (
  localUri: string,
  filename: string,
  mimeType: string,
): Promise<UploadAttachmentResponse> => {
  const formData = new FormData();
  const cleanUri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;

  formData.append('file', {
    uri: Platform.OS === 'ios' ? localUri : cleanUri,
    name: filename,
    type: mimeType,
  } as any);

  const res = await apiClient.post<UploadAttachmentResponse>(
    '/messages/attachments/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data,
    },
  );

  return res.data;
};
