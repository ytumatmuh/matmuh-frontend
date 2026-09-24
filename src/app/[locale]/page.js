import Landing from "@/app/components/Landing/Landing";
import PageLayout from "@/app/components/PageLayout";
import QuickLinks from "@/app/components/QuickLinks";
import MainCard from "@/app/components/MainCard";
import AnnouncementList from "@/app/components/Announcements/AnnouncementList";
import CategoryChips from "@/app/components/Announcements/CategoryChips";
import NewsList from "@/app/components/Announcements/NewsList";
import NewRecordDialog from "@/app/components/Announcements/NewRecordDialog";
import {
  CONTENT_CATEGORIES,
  HOME_CATEGORY_IDS,
  announcementHref,
  getAnnouncements,
  getNews,
  newsHref,
} from "@/data/content";
import { Bell, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/date";
import { EditableRegion } from "inscribed";
import { translate } from "@/i18n";

export const revalidate = 3600;

export default async function LandingPage({ params }) {
  const { locale } = await params;
  const [{ items: announcements }, { items: news }] = await Promise.all([
    getAnnouncements({ limit: 8, locale }),
    getNews({ limit: 3, locale }),
  ]);

  const announcementsHref = locale && locale !== "tr" ? `/${locale}/duyurular` : "/duyurular";
  const newsListHref = locale && locale !== "tr" ? `/${locale}/haberler` : "/haberler";

  const homeCategories = CONTENT_CATEGORIES.filter((c) =>
    HOME_CATEGORY_IDS.includes(c.id),
  );

  const highlights = [
    announcements[0] && {
      label: translate(locale, "Son duyuru"),
      title: announcements[0].title,
      href: announcementHref(announcements[0], locale),
      date: formatDate(announcements[0].publishedAt, locale),
    },
    news[0] && {
      label: translate(locale, "Son haber"),
      title: news[0].title,
      href: newsHref(news[0], locale),
      date: formatDate(news[0].publishedAt, locale),
    },
  ].filter(Boolean);

  return (
    <>
      <Landing highlights={highlights} />

      <PageLayout sidebar={<QuickLinks />} sidebarFirst overlapSidebar>
        <div className="space-y-6">
          <MainCard
            title={
              <EditableRegion
                blockPath="announcements.title"
                blockType="ShortText"
                defaultValue={{ tr: "Duyurular", en: "Announcements" }}
              />
            }
            icon={Bell}
            buttonTitle={translate(locale, "Tümünü Gör")}
            href={announcementsHref}
            prefetch={false}
            action={
              <NewRecordDialog
                collection="announcements"
                page="/duyurular/yeni"
                label="Yeni"
                title="Yeni Duyuru"
                submitLabel="Yayımla"
              />
            }
          >
            <div className="pb-3 mb-1 border-b border-primary-500/6">
              <CategoryChips categories={homeCategories} />
            </div>
            <AnnouncementList items={announcements} locale={locale} />
          </MainCard>

          <MainCard
            title={
              <EditableRegion
                blockPath="news.title"
                blockType="ShortText"
                defaultValue={{ tr: "Haberler ve Etkinlikler", en: "News and Events" }}
              />
            }
            icon={Newspaper}
            buttonTitle={translate(locale, "Tümünü Gör")}
            href={newsListHref}
            prefetch={false}
            action={
              <NewRecordDialog
                collection="news"
                page="/haberler/yeni"
                label="Yeni"
                title="Yeni Haber"
                submitLabel="Yayımla"
              />
            }
          >
            <NewsList items={news} locale={locale} />
          </MainCard>
        </div>
      </PageLayout>
    </>
  );
}
