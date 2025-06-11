import React, { HTMLAttributes, useEffect, useState } from 'react';
import axios from 'axios';

interface InlineSvgProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
}

const InlineSvg: React.FC<InlineSvgProps> = ({ src, ...props }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchSvg = async () => {
      setSvg(null);
      setError(false);

      if (!src) {
        return;
      }

      try {
        const response = await axios.get<string>(src);
        setSvg(response.data);
      } catch (err) {
        console.error('Failed to fetch SVG:', err);
        setError(true);
      }
    };

    void fetchSvg();
  }, [src]);

  if (error) {
    return (
      <div
        {...props}
        style={{ ...props.style, color: 'red' }}
      >
        ⚠️
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        {...props}
        style={{ ...props.style, width: '100%', height: '100%' }}
      />
    );
  }

  return (
    <div
      {...props}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default InlineSvg;
