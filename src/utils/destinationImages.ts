/**
 * Maps destination query to curated high-resolution editorial travel imagery.
 */
export const DEFAULT_DESTINATION_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop';

export const getDestinationImage = (dest?: string): string => {
  if (!dest) {
    return DEFAULT_DESTINATION_IMAGE;
  }
  const d = dest.toLowerCase();
  if (d.includes('lisbon') || d.includes('portugal')) {
    return 'https://images.unsplash.com/photo-1585286289943-22877a16fb8e?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('tokyo') || d.includes('japan')) {
    return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('paris') || d.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('london') || d.includes('uk') || d.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('new york') || d.includes('nyc')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('rome') || d.includes('italy')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('barcelona') || d.includes('spain')) {
    return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('bali') || d.includes('indonesia')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('amsterdam') || d.includes('netherlands')) {
    return 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('dubai') || d.includes('uae')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('swiss') || d.includes('switzerland') || d.includes('alps')) {
    return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop';
  }
  return DEFAULT_DESTINATION_IMAGE;
};
