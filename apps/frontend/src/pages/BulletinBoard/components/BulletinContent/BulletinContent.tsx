/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useMemo } from 'react';
import parse, { DOMNode, domToReact, Element, HTMLReactParserOptions } from 'html-react-parser';
import ImageButton from '@/pages/BulletinBoard/components/BulletinContent/ImageButton';
import LinkWrapper from '@/pages/BulletinBoard/components/BulletinContent/LinkWrapper';

interface BulletinContentProps {
  html: string;
  handleImageClick: (imageUrl: string) => void;
}

const createParserOptions = (handleImageClick: (url: string) => void): HTMLReactParserOptions => ({
  replace: (node) => {
    if (!(node instanceof Element)) {
      return undefined;
    }

    if (node.name === 'img') {
      const src = node.attribs.src.replace(/^\/(?!\/)/, '/');
      return (
        <ImageButton
          key={src}
          src={src}
          onClick={handleImageClick}
        />
      );
    }

    if (node.name === 'a') {
      const href = node.attribs.href || '#';
      const isPdf = href.toLowerCase().endsWith('.pdf');
      return (
        <LinkWrapper
          key={href}
          href={href}
          isPdf={isPdf}
        >
          {domToReact(node.children as DOMNode[], createParserOptions(handleImageClick))}
        </LinkWrapper>
      );
    }

    return undefined;
  },
});

const BulletinContent: React.FC<BulletinContentProps> = ({ html, handleImageClick }) => {
  const options = useMemo(() => createParserOptions(handleImageClick), [handleImageClick]);

  return parse(html, options);
};

export default BulletinContent;
