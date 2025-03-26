import CollectFileJobData from "@libs/queue/types/collectFileJobData";
import DuplicateFileJobData from "@libs/queue/types/duplicateFileJobData";

type JobData = CollectFileJobData  | DuplicateFileJobData;

export default JobData;