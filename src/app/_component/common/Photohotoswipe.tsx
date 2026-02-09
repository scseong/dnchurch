'use client';

import { Gallery, Item, type ItemProps } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';

type ItemOptionalProps = Pick<
  ItemProps<any>,
  'alt' | 'caption' | 'thumbnail' | 'id' | 'cropped' | 'sourceId'
>;

type Props = {
  images: string[];
  width: number;
  height: number;
  itemOptions?: ItemOptionalProps;
  renderImage: (args: {
    src: string;
    open: (e: React.MouseEvent<Element>) => void;
    ref: (el: HTMLImageElement | null) => void;
    index: number;
  }) => React.ReactElement;
};

export default function Photohotoswipe({ images, width, height, itemOptions, renderImage }: Props) {
  return (
    <Gallery>
      {images.map((src, index) => (
        <Item
          key={src}
          original={src}
          thumbnail={src}
          width={width}
          height={height}
          {...itemOptions}
        >
          {({ ref, open }) =>
            renderImage({
              src,
              open,
              ref,
              index
            })
          }
        </Item>
      ))}
    </Gallery>
  );
}
