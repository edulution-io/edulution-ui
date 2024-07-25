enum FileSharingApiEndpoints {
  FILESHARING_ACTIONS = '/filesharing',
  BASE = 'filesharing',
  MOUNTPOINTS = 'mountpoints',
  FILES = 'files',
  DIRECTORIES = 'dirs',
  CREATE_FOLDER = 'folder',
  CREATE_FILE = 'file',
  UPLOAD_FILE = 'item',
  DELETE_FILES = ':filePath(*)',
  RENAME_RESOURCE = 'name',
  MOVE_RESOURCE = 'locations',
  GET_DOWNLOAD_LINK = 'download-links',
  FILE_STREAM = 'file-stream',
}

export default FileSharingApiEndpoints;
