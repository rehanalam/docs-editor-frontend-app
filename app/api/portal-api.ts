import axios from "axios";

export const BASE_URL = 'http://localhost:3000/api/portal';


export class PortalService {

  async generatePortal(payload: {
    owner: string;
    repo: string;
    authKey: string;
  }) {
    const response = await axios.post(
      `${BASE_URL}/generate`,
      payload,
      {
        headers: {
          'X-Auth-Key': payload.authKey,
        },
      }
    );
    return response;
  }

  async generateAndDownloadPortal(payload: {
    owner: string;
    repo: string;
    authKey: string;
  }) {
    const response = await axios.post(
      `${BASE_URL}/generate-onprem`,
      payload,
      {
        responseType: 'blob', // Required to receive ZIP as binary
      }
    );

    const blob = new Blob([response.data], { type: 'application/zip' });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${payload.repo}-onprem.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

    async generateHostedPortal(payload: {
    owner: string;
    repo: string;
    authKey: string;
  }): Promise<{ url: string }> {
    const response = await axios.post(`${BASE_URL}/hosted-portal`, payload);
    return response.data; // { url: 'http://localhost:3000/api/portal/preview/...' }
  }
}

export const portalService = new PortalService();