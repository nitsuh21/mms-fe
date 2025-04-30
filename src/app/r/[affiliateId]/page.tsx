'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Card } from '@/components/ui';
import { affiliateService } from '@/services/affiliateService';
import { FiPhone, FiMapPin, FiGlobe, FiInstagram, FiTwitter, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
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
  logo_url?: string;
  cover_image_url?: string;
  phone?: string;
  website?: string;
  address?: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  social_media: Record<string, string>;
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
        console.error('Failed to record page visit:', error);
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

      if (activityType === 'CALL_CLICK' && metadata?.phone) {
        window.location.href = `tel:${metadata.phone}`;
      } else if (activityType === 'SOCIAL_CLICK' && metadata?.url) {
        window.open(metadata.url, '_blank');
      }
    } catch (error) {
      console.error(`Failed to record ${activityType}:`, error);
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
          {business.cover_image_url && (
            <div 
              className="h-48 w-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${business.cover_image_url})` }} 
            />
          )}
          <div className="p-8">
            {/* Business Info */}
            <div className="flex items-center gap-6 mb-8">
              {business.logo_url && (
                <div className="flex-shrink-0">
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    width={80}
                    height={80}
                    className="rounded-lg shadow-md"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                <p className="text-gray-600 text-lg">{business.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {business.logo_url && (
                <img 
                  src={business.logo_url} 
                  alt={business.name} 
                  className="w-16 h-16 rounded-full object-cover" 
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{business.name}</h1>
                <p className="text-gray-600">{business.description}</p>
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

              {business.whatsapp && (
                <Button
                  onClick={() => handleSocialClick('whatsapp', `https://wa.me/${business.whatsapp}`)}
                  className="flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  WhatsApp
                </Button>
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
                  <div className="flex justify-between p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span>Monday - Friday</span>
                    <span>{business.business_hours.weekday}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span>Saturday</span>
                    <span>{business.business_hours.saturday}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span>Sunday</span>
                    <span>{business.business_hours.sunday}</span>
                  </div>
                </div>
              </div>
            )}

            {business.social_media && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white p-3 rounded-full shadow-md">
                    <FiInstagram className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Social Media</h2>
                </div>
                <div className="flex gap-6">
                  {business.social_media.instagram && (
                    <a
                      href={business.social_media.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleSocialClick('instagram', business.social_media.instagram)}
                      className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-600 hover:text-pink-600 hover:scale-110"
                    >
                      <FiInstagram className="w-6 h-6" />
                    </a>
                  )}
                  {business.social_media.twitter && (
                    <a
                      href={business.social_media.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleSocialClick('twitter', business.social_media.twitter)}
                      className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-600 hover:text-blue-400 hover:scale-110"
                    >
                      <FiTwitter className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
