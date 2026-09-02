import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { PendingAttachment } from 'schemas';
import { uploadAttachment } from 'api/attachments';

export const useAttachments = () => {
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  const addAttachment = useCallback((attachment: PendingAttachment) => {
    setPendingAttachments(prev => [...prev, attachment]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetAttachments = useCallback(() => {
    setPendingAttachments([]);
  }, []);

  // Returns uploaded IDs on success, null if any upload failed
  const uploadAll = useCallback(async (): Promise<string[] | null> => {
    const updated = [...pendingAttachments];
    const ids: string[] = [];

    for (let i = 0; i < updated.length; i++) {
      const att = updated[i];
      if (att.status === 'done' && att.uploadedId) {
        ids.push(att.uploadedId);
        continue;
      }

      updated[i] = { ...att, status: 'uploading' };
      setPendingAttachments([...updated]);

      try {
        const res = await uploadAttachment(att.localUri, att.filename, att.mimeType);
        updated[i] = { ...att, status: 'done', uploadedId: res.attachmentId, uploadedUrl: res.url };
        ids.push(res.attachmentId);
      } catch {
        updated[i] = { ...att, status: 'error' };
        setPendingAttachments([...updated]);
        Alert.alert('Upload failed', `Could not upload "${att.filename}". Tap Send to retry.`);
        return null;
      }
    }

    setPendingAttachments([...updated]);
    return ids;
  }, [pendingAttachments]);

  return { pendingAttachments, addAttachment, removeAttachment, resetAttachments, uploadAll };
};
