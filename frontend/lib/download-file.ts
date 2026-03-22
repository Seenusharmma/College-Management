interface DownloadOptions {
  url: string;
  filename?: string;
  onProgress?: (progress: number) => void;
}

export async function downloadFile(options: DownloadOptions): Promise<void> {
  const { url, filename, onProgress } = options;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let originalFilename = filename;

    if (!originalFilename && contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        originalFilename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    if (!originalFilename) {
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const queryIndex = lastPart.indexOf('?');
      originalFilename = queryIndex > -1 ? lastPart.substring(0, queryIndex) : lastPart;
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = originalFilename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

export function getFileExtension(mimetype: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm'
  };

  return mimeToExt[mimetype] || 'bin';
}
