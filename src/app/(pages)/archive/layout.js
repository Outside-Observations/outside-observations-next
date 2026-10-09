import {
  DEFAULT_ARCHIVE_PAGE_LIMIT,
  getPaginatedArchivePage,
} from '@/app/_data/getPaginatedArchivePage';
import MoodPanelHost from '@/app/_components/Archive/features/navigation/MoodPanelHost';
import ArchiveEntriesProvider from '@/app/_components/Archive/providers/ArchiveEntriesProvider';
import ClosedArchiveRedirect from '@/app/_components/Archive/features/unexpected/ClosedArchiveRedirect';
import { ErrorBoundary } from '@/app/_components/shared/error/ErrorBoundary';
import { useTimezoneRedirect } from '@/lib/closedArchiveHours';

export const revalidate = 60;

// The first page is loaded for every archive route, entry pages included.
// Reading the request path to load it on the index only (headers()) made
// the whole /archive section render on every request, uncached. Entry
// pages also need the list anyway, for the previous / next arrows.
export default async function ArchiveLayout({ children }) {
  const initialPage = await getPaginatedArchivePage({
    cursor: null,
    limit: DEFAULT_ARCHIVE_PAGE_LIMIT,
    sortColumn: null,
    sortDirection: null,
    moodTags: [],
    searchIds: [],
  });
  const content = (
    <>
      {children}
      <MoodPanelHost />
    </>
  );

  return (
    <ErrorBoundary>
      <ArchiveEntriesProvider
        initialEntries={initialPage.items}
        initialCursor={initialPage.nextCursor}
        initialHasMore={initialPage.hasMore}
        skipInitialFetch={initialPage.items.length > 0}
      >
        {useTimezoneRedirect ? content : <ClosedArchiveRedirect>{content}</ClosedArchiveRedirect>}
      </ArchiveEntriesProvider>
    </ErrorBoundary>
  );
}
