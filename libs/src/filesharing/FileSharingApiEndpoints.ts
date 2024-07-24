enum FileSharingApiEndpoints {
  FILESHARING_ACTIONS = '/filesharing',
  BASE = 'filesharing',
  MOUNTPOINTS = 'mountpoints',
  FILES = 'files/*',
  FILES_ENDPOINT = 'files/',
  DIRECTORIES = 'dirs/*',
  CREATE_FOLDER = 'createFolder',
  CREATE_FILE = 'createFile',
  UPLOAD_FILE = 'uploadFile',
  DELETE_FILES = ':filePath(*)',
  RENAME_RESOURCE = 'name',
  MOVE_RESOURCE = 'locations',
  GET_DOWNLOAD_LINK = 'download-links',
  FILE_STREAM = 'file-stream',
}

export default FileSharingApiEndpoints;
