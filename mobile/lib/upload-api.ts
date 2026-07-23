import * as FileSystem from 'expo-file-system/legacy';
import { FileSystemUploadType } from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

export type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

export type ResumeParsedData = {
  university: string;
  majors: string;
  desiredCareer: string;
  phone: string;
  linkedinUrl: string;
};

function getMimeType(fileName: string, mimeType?: string): string {
  if (mimeType && mimeType !== 'application/octet-stream') {
    return mimeType;
  }
  const ext = fileName?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/pdf';
  }
}

export async function uploadProfilePicture(file: PickedFile): Promise<{ filePath: string }> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.68.100:5000';
  const token = await SecureStore.getItemAsync('token');
  const mimeType = getMimeType(file.name, file.type);
  const uploadUrl = `${baseUrl}/api/upload/profile-picture`;

  const headers: Record<string, string> = {
    'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await FileSystem.uploadAsync(uploadUrl, file.uri, {
    httpMethod: 'POST',
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: 'profilePicture',
    mimeType: mimeType,
    parameters: {},
    headers: headers,
  });

  if (response.status < 200 || response.status >= 300) {
    let errorMsg = 'Profile picture upload failed';
    try {
      const parsedErr = JSON.parse(response.body);
      errorMsg = parsedErr.error || parsedErr.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return JSON.parse(response.body);
}

export async function uploadResume(
  file: PickedFile
): Promise<{ filePath: string; parsedData: ResumeParsedData }> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.68.100:5000';
  const token = await SecureStore.getItemAsync('token');
  const mimeType = getMimeType(file.name, file.type);
  const uploadUrl = `${baseUrl}/api/upload/resume`;

  const headers: Record<string, string> = {
    'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await FileSystem.uploadAsync(uploadUrl, file.uri, {
    httpMethod: 'POST',
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: 'resume',
    mimeType: mimeType,
    parameters: {},
    headers: headers,
  });

  if (response.status < 200 || response.status >= 300) {
    let errorMsg = 'Resume upload failed';
    try {
      const parsedErr = JSON.parse(response.body);
      errorMsg = parsedErr.error || parsedErr.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return JSON.parse(response.body);
}
