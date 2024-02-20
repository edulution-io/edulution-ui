import React from 'react';
interface DirectoryBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({ path, onNavigate }) => {
  const segments = path.split('/').filter(Boolean);
  console.log(segments)

  const handleSegmentClick = (segmentIndex: number) => {
    const pathTo = '/' + segments.slice(0, segmentIndex + 1).join('/');
    onNavigate(pathTo);
  };

  return (
    <div className="flex space-x-2">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => handleSegmentClick(index)}
            className="text-blue-500 hover:underline"
          >
            {segment}
          </button>
          {index < segments.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
