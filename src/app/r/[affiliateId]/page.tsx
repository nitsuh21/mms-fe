'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Card } from '@/components/ui';
import { affiliateService } from '@/services/affiliateService';
import type { DaySchedule } from '@/types/business';
import { FiPhone, FiMapPin, FiGlobe, FiInstagram, FiTwitter, FiClock, FiMail, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaTiktok, FaYoutube, FaTelegram } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

type BusinessHours = {
  weekday: string;
  saturday: string;
  sunday: string;
};

type Business = {
  id: number;
  name: string;
  description: string;
  logo?: string;
  cover_image?: string;
  phone?: string;
  website?: string;
  address?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  business_hours: BusinessHours;
};

type ActivityType = 'PAGE_VISIT' | 'CALL_CLICK' | 'SOCIAL_CLICK';

type ActivityMetadata = {
  phone?: string;
  platform?: string;
  url?: string;
};

type ActivityPayload = {
  affiliate_id: string;
  activity_type: ActivityType;
  metadata?: ActivityMetadata;
};

export default function BusinessLandingPage() {
  const { affiliateId } = useParams() as { affiliateId: string };

  const { data: business, isLoading } = useQuery<Business>({
    queryKey: ['business', affiliateId],
    queryFn: () => affiliateService.getBusinessByAffiliateId(affiliateId)
  });

  useEffect(() => {
    const recordVisit = async () => {
      try {
        await affiliateService.createActivity({
          affiliate_id: affiliateId,
          activity_type: 'PAGE_VISIT'
        });
      } catch (error) {
        // Log error but don't show to user since this is background tracking
        console.error('Failed to record page visit:', error);
        // Don't throw error to prevent page from crashing
      }
    };
    void recordVisit();
  }, [affiliateId]);

  const handleActivity = async (activityType: ActivityType, metadata?: ActivityMetadata) => {
    try {
      await affiliateService.createActivity({
        affiliate_id: affiliateId,
        activity_type: activityType,
        metadata
      });

      // Only perform the action if activity was recorded successfully
      if (activityType === 'CALL_CLICK' && metadata?.phone) {
        window.location.href = `tel:${metadata.phone}`;
      } else if (activityType === 'SOCIAL_CLICK' && metadata?.url) {
        window.open(metadata.url, '_blank');
      }
    } catch (error) {
      console.error(`Failed to record ${activityType}:`, error);
      // Show error toast or notification here if needed
      // But still allow the action to proceed
      if (activityType === 'CALL_CLICK' && metadata?.phone) {
        window.location.href = `tel:${metadata.phone}`;
      } else if (activityType === 'SOCIAL_CLICK' && metadata?.url) {
        window.open(metadata.url, '_blank');
      }
    }
  };

  const handleCallClick = () => {
    if (business?.phone) {
      void handleActivity('CALL_CLICK', { phone: business.phone });
    }
  };

  const handleSocialClick = (platform: string, url: string) => {
    void handleActivity('SOCIAL_CLICK', { platform, url });
  };

  const handleWebsiteClick = () => {
    if (business?.website) {
      void handleActivity('SOCIAL_CLICK', { platform: 'website', url: business.website });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse w-1/3" />
              <div className="h-4 bg-gray-200 animate-pulse w-2/3" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <p className="text-gray-500">Business not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link href="/" className="inline-block">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-800">MMS</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="relative overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl">
          {business.cover_image && business.cover_image_url ? (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={business.cover_image_url}
                alt={`${business.name} cover`}
                fill
                className="object-cover"
                onError={(e) => {
                  // Hide the image on error
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ) : null}
          <div className="p-6">
            {/* Business Info */}
            <div className="flex items-center gap-4 mb-6">
              {business.logo && business.logo_url ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide the image on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-gray-600 mt-1">{business.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {business.phone && (
                <Button
                  onClick={handleCallClick}
                  className="flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FiPhone className="w-5 h-5" />
                  Call Now
                </Button>
              )}

              {business.website && (
                <Button
                  onClick={handleWebsiteClick}
                  className="flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FiGlobe className="w-5 h-5" />
                  Visit Website
                </Button>
              )}
            </div>

            {/* Available Social media Icons with hrefs */}
            <div className="flex items-center gap-4 mt-8">
              {business.instagram && (
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('instagram', business.instagram!)}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FiInstagram className="w-5 h-5 text-pink-600" />
                </a>
              )}
              {business.facebook && (
                <a
                  href={business.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('facebook', business.facebook!)}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FaFacebookF className="w-5 h-5 text-blue-600" />
                </a>
              )}
              {business.tiktok && (
                <a
                  href={business.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('tiktok', business.tiktok!)}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FaTiktok className="w-5 h-5 text-black" />
                </a>
              )}
              {business.youtube && (
                <a
                  href={business.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('youtube', business.youtube!)}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FaYoutube className="w-5 h-5 text-red-600" />
                </a>
              )}
              {business.telegram && (
                <a
                  href={business.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('telegram', business.telegram!)}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FaTelegram className="w-5 h-5 text-blue-600" />
                </a>
              )}
              {business.twitter && (
                <a
                  href={business.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('twitter', business.twitter!)}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FiX className="w-5 h-5 text-blue-400" />
                </a>
              )}
            </div>

              {business.address && (
                <div className="mt-8 flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-md">
                    <FiMapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-600">{business.address}</p>
                    {business.google_maps_url && (
                      <a
                        href={business.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-1 inline-block"
                        onClick={() => handleSocialClick('google_maps', business.google_maps_url!)}
                      >
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}

            {business.business_hours && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white p-3 rounded-full shadow-md">
                    <FiClock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
                </div>
                <div className="space-y-3 mt-4">
                  {Object.entries(business.business_hours).map(([day, schedule]) => {
                    const hours = schedule as unknown as DaySchedule;
                    return (
                      <div key={day} className="flex justify-between p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                        <span className="capitalize">{day}</span>
                        <span>
                          {hours.open} - {hours.close}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white p-3 rounded-full shadow-md">
                  <FiGlobe className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Connect With Us</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('email', `mailto:${business.email}`)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FiMail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">Email</span>
                  </a>
                )}
                {business.instagram && (
                  <a
                    href={business.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('instagram', business.instagram!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FiInstagram className="w-5 h-5 text-pink-600" />
                    <span className="text-sm">Instagram</span>
                  </a>
                )}
                {business.facebook && (
                  <a
                    href={business.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('facebook', business.facebook!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaFacebookF className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Facebook</span>
                  </a>
                )}
                {business.twitter && (
                  <a
                    href={business.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('twitter', business.twitter!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FiTwitter className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
                {business.tiktok && (
                  <a
                    href={business.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('tiktok', business.tiktok!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaTiktok className="w-5 h-5 text-black" />
                    <span className="text-sm">TikTok</span>
                  </a>
                )}
                {business.youtube && (
                  <a
                    href={business.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('youtube', business.youtube!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaYoutube className="w-5 h-5 text-red-600" />
                    <span className="text-sm">YouTube</span>
                  </a>
                )}
                {business.whatsapp && (
                  <a
                    href={business.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('whatsapp', business.whatsapp!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaWhatsapp className="w-5 h-5 text-green-600" />
                    <span className="text-sm">WhatsApp</span>
                  </a>
                )}
                {business.telegram && (
                  <a
                    href={business.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick('telegram', business.telegram!)}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaTelegram className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Telegram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
