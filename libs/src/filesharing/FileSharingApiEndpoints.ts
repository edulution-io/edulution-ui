enum FileSharingApiEndpoints {
  FILESHARING_ACTIONS = '/filesharing',
  BASE = 'filesharing',
  MOUNTPOINTS = 'mountpoints',
  FILES = 'files',
  DIRECTORIES = 'directories',
  CREATE_FOLDER = 'createFolder',
  CREATE_FILE = 'createFile',
  UPLOAD_FILE = 'upload',
  DELETE_FILES = ':filePath(*)',
  RENAME_RESOURCE = 'rename',
  MOVE_RESOURCE = 'move',
  GET_DOWNLOAD_LINK = 'download-links',
  FILE_STREAM = 'file-stream',
}

export default FileSharingApiEndpoints;
