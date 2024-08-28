// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
interface LmnApiRoom {
  usersList: string[];
  name: string;
  objects: { [key: string]: ObjectDetail };
}

interface ObjectDetail {
  PORT: string;
  ROOM: string;
  IP: string;
  SMBSTATUS_LINE: string;
  IPV4: string;
  COMPUTER: string | null;
}

export default LmnApiRoom;
