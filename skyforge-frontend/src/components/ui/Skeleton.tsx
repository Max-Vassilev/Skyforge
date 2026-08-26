import type { CSSProperties } from 'react';
import { cx } from './cx';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

export default function Skeleton({
  width,
  height,
  radius,
  className,
}: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  };
  return (
    <span className={cx('skeleton', className)} style={style} aria-hidden="true" />
  );
}
