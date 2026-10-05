'use client';

import Link from 'next/link';
import { memo, useState } from 'react';
import { usePrefetchOnHover } from '@/app/_hooks/shared/usePrefetchOnHover';
import { useContentWarningConsent } from '@/app/_contexts/archive/ContentWarningConsentContext';
import { useArchiveEntryVisited } from '@/app/_hooks/archive/useArchiveEntryVisited';
import { trackArchiveEntryClickFromEntry } from '@/app/_helpers/analytics/gtag';
import { saveArchiveScrollPosition } from '@/app/_hooks/archive/useArchiveScrollPosition';
import ArchiveVisualEssay from '@/app/_components/Archive/features/entry/ArchiveVisualEssay';
import SanityVideo from '@/sanity/components/SanityVideo';
import SanityImage from '@/sanity/components/SanityImage';
import { ProtectedMediaWrapper } from '@/app/_components/Archive/features/entry/ProtectedMediaWrapper';
import {
  showHoverCaption,
  hideHoverCaption,
} from '@/app/_components/Archive/state/archiveHoverCaptionStore';
import styles from '@app/_assets/archive/archive-page.module.css';

const POSTER_WIDTH = 300;
const HOVER_CAPTION_QUERY = '(hover: hover) and (min-width: 769px)';

// The caption fits when it neither runs past the image's width nor stacks
// higher than the room the overlay leaves for it. Measured on the hidden
// in-image caption, which keeps its layout (visibility only).
function captionFitsInImage(wrapper) {
  const overlay = wrapper.querySelector(`.${styles.archiveEntryImageOverlay}`);
  const caption = wrapper.querySelector(`.${styles.archiveEntryImageOverlayContent}`);
  if (!overlay || !caption) return true;
  const overlayStyle = getComputedStyle(overlay);
  const roomWidth = overlay.clientWidth
    - parseFloat(overlayStyle.paddingLeft) - parseFloat(overlayStyle.paddingRight);
  const roomHeight = overlay.clientHeight
    - parseFloat(overlayStyle.paddingTop) - parseFloat(overlayStyle.paddingBottom);
  return caption.scrollWidth <= Math.ceil(roomWidth) && caption.offsetHeight <= Math.ceil(roomHeight);
}

function ArchiveEntryMediaLink({
  entry,
  onImageLoad,
  index = 0,
  currentView = 'images',
  currentSearchStatus = null,
}) {
  const isWidlineMedia = entry?.kind === 'widlineMedia';
  const slug = entry.metadata?.slug || entry.slug;
  const hasSlug = slug?.current;
  const slugValue = slug?.current || null;
  const isVisualEssay = entry.mediaType === 'visualEssay';
  const widlineMediaIndex = Number.isInteger(entry?.widlineMediaIndex) ? entry.widlineMediaIndex : 0;
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const href = isWidlineMedia
    ? `/archive/widline-cadet?media=${widlineMediaIndex}`
    : hasSlug
      ? `/archive/entry/${slug.current}${isVisualEssay ? `?image=${currentImageIndex}` : ''}`
      : null;
  const prefetchHandlers = usePrefetchOnHover(href, 300);
  const isPriority = index < 4;
  const isVideo = entry.mediaType === 'video';
  const posterHeight = entry?.poster?.dimensions?.aspectRatio
    ? Math.round(POSTER_WIDTH / entry.poster.dimensions.aspectRatio)
    : POSTER_WIDTH;

  const isVisited = useArchiveEntryVisited(slugValue);

  const { hasConsent } = useContentWarningConsent();
  const hasContentWarning = entry.metadata?.contentWarning === true;

  const view = currentView;
  const searchStatus = currentSearchStatus;

  const prepareNavigationRestore = () => {
    if (view) {
      try {
        saveArchiveScrollPosition(view);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const handleMouseDown = () => {
    prepareNavigationRestore();
    if (!isWidlineMedia) {
      trackArchiveEntryClickFromEntry(entry, view ?? 'images', searchStatus ?? {});
    }
  };

  const handleClick = () => {
    prepareNavigationRestore();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      prepareNavigationRestore();
    }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      prepareNavigationRestore();
    }
  };

  const overlayMeta = isVisualEssay && currentImage?.metadata
    ? currentImage.metadata
    : entry.metadata;
  const overlayYear = overlayMeta?.year?.value ?? entry.year ?? '';
  const overlaySource = overlayMeta?.source || entry.source || '';
  const overlayArtName = overlayMeta?.artName || entry.artName || '';

  const hasYear = String(overlayYear ?? '').trim() !== '';
  const hasSource = String(overlaySource ?? '').trim() !== '';
  const hasArtName = String(overlayArtName ?? '').trim() !== '';

  const shouldShowMetadataOverlay = !hasContentWarning || hasConsent;
  const shouldShowOverlayContent = shouldShowMetadataOverlay && !isVisualEssay;

  // Only when the caption has no room in the image (see archiveHoverCaptionStore):
  // the hovered thumbnail then hides it and hands it to the shared tooltip.
  const captionId = entry._id;
  const handleMouseEnter = (event) => {
    const wrapper = event.currentTarget;
    if (!shouldShowOverlayContent) return;
    if (!window.matchMedia(HOVER_CAPTION_QUERY).matches) return;
    const fits = captionFitsInImage(wrapper);
    wrapper.dataset.captionOutside = fits ? 'false' : 'true';
    if (fits) return;
    const items = [overlayYear, overlaySource, overlayArtName]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);
    if (items.length === 0) return;
    showHoverCaption({ id: captionId, rect: wrapper.getBoundingClientRect(), items, visited: isVisited });
  };
  const handleMouseLeave = () => hideHoverCaption(captionId);

  const content = (
    <div
      className={styles.archiveEntryImageWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isVisualEssay ? (
        <ArchiveVisualEssay
          entry={entry}
          width={POSTER_WIDTH}
          contentWarning={entry.metadata?.contentWarning}
          priority={isPriority}
          onCurrentImageChange={(img, idx) => {
            setCurrentImage(img);
            if (typeof idx === 'number') setCurrentImageIndex(idx);
          }}
        />
      ) : isVideo && (entry.video?.asset?.url || entry.vimeoUrl || entry.videoExcerptUrl) ? (
        <ProtectedMediaWrapper
          contentWarning={entry.metadata?.contentWarning}
        >
          <SanityVideo
            video={entry.video}
            poster={entry.poster}
            vimeoUrl={entry.videoExcerptUrl || entry.vimeoUrl}
            sizes="(max-width: 768px) 50vw, 20vw"
            alt={[entry.metadata?.artName || entry.artName || 'Archive entry video', entry.metadata?.source || entry.source].filter(Boolean).join(' - ')}
            className={styles.archiveEntryVideo}
            fallbackClassName={styles.archiveEntryImage}
            width={POSTER_WIDTH}
            height={posterHeight}
            priority={isPriority}
            preload={isPriority ? 'metadata' : 'none'}
            muted
            playsInline
            onLoad={onImageLoad}
          />
        </ProtectedMediaWrapper>
      ) : (
        <ProtectedMediaWrapper
          contentWarning={entry.metadata?.contentWarning}
        >
          <SanityImage
            image={entry.poster}
            sizes="(max-width: 768px) 50vw, 20vw"
            alt={[entry.metadata?.artName || entry.artName || 'Archive entry poster', entry.metadata?.source || entry.source].filter(Boolean).join(' - ')}
            className={styles.archiveEntryImage}
            width={POSTER_WIDTH}
            height={posterHeight}
            priority={isPriority}
            loading={isPriority ? undefined : 'lazy'}
            placeholder={entry?.poster?.lqip ? 'blur' : undefined}
            blurDataURL={entry?.poster?.lqip || undefined}
                quality={isPriority ? 70 : 50}
            onLoad={onImageLoad}
          />
        </ProtectedMediaWrapper>
      )}
      {shouldShowMetadataOverlay && (
        <div className={styles.archiveEntryImageOverlay}>
          {shouldShowOverlayContent && (
            <div className={styles.archiveEntryImageOverlayContent}>
              {hasYear && (
                <div className={styles.archiveEntryImageOverlayContentItem}><p>{overlayYear}</p></div>
              )}
              {hasSource && (
                <div className={styles.archiveEntryImageOverlayContentItem}><p>{overlaySource}</p></div>
              )}
              {hasArtName && (
                <div className={styles.archiveEntryImageOverlayContentItem}><p>{overlayArtName}</p></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const linkProps = {
    className: styles.archiveEntryImageLink,
    'data-visited': isVisited ? 'true' : 'false',
  };

  const isLinkDisabled = hasContentWarning && !hasConsent;
  const shouldRenderLink = !!href && !isLinkDisabled;

  return (
    <div className={styles.archiveEntryImageContainer}>
      {shouldRenderLink ? (
        <Link
          href={href}
          prefetch={isWidlineMedia ? false : undefined}
          scroll={false}
          {...linkProps}
          {...prefetchHandlers}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
        >
          {content}
        </Link>
      ) : (
        <div {...linkProps}>
          {content}
        </div>
      )}
    </div>
  );
}

export default memo(ArchiveEntryMediaLink, (prev, next) => {
  return (
    prev.entry === next.entry &&
    prev.index === next.index &&
    prev.onImageLoad === next.onImageLoad &&
    prev.currentView === next.currentView &&
    prev.currentSearchStatus === next.currentSearchStatus
  );
});
