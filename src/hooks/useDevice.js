import { useMemo } from 'react';
import { useSize } from 'ahooks'
import { isMobileDevice } from 'lib/legacy'
export default function useDevice() {
  const size = useSize(document.querySelector('body'));
  const device = useMemo(() => {
    return isMobileDevice() && size.width < 768 ? {
      isMobile: true
    } : {
      isMobile: false
    }
  }, [size.width])
  return device
}