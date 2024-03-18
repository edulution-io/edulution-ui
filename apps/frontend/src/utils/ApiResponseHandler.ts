function handleError(response: Response) {
  if (response.status >= 400 && response.status < 600) {
    return { success: false, message: response.statusText, status: response.status };
  }
  return { success: false, message: 'Unexpected response', status: response.status };
}

function handleApiResponse(response: Response) {
  if (!response.ok) {
    return handleError(response);
  }
  return { success: true };
}

export default { handleApiResponse };
