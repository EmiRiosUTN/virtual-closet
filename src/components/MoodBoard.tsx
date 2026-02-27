import { useState, useEffect } from 'react';
import { Layout, Heart, Sparkles, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem, Outfit } from '../types';
import { storageService } from '../services/storage';
import { unsplashService, InspirationImage } from '../services/unsplash';
import { PageHeader } from './PageHeader';
import { ImageModal } from './ImageModal';

type MoodBoardItem =
    | { type: 'clothing'; data: ClothingItem; aspect: string }
    | { type: 'outfit'; data: Outfit; items: ClothingItem[]; aspect: string }
    | { type: 'inspiration'; data: InspirationImage; aspect: string };

const aspectRatioClasses = [
    'aspect-[3/4]',
    'aspect-[4/5]',
    'aspect-square',
    'aspect-[9/16]',
    'aspect-[4/3]'
];

const categoryToEnglish: Record<string, string> = {
    'Blusas': 'blouse',
    'Remeras': 't-shirt',
    'Sweaters': 'sweater',
    'Pantalones': 'pants trousers',
    'Polleras': 'skirt',
    'Shorts': 'shorts',
    'Vestidos': 'dress',
    'Chalecos y blazers': 'blazer',
    'Abrigos y camperas': 'coat',
    'Accesorios': 'accessories',
    'Zapatos': 'shoes'
};

const colorToEnglish: Record<string, string> = {
    'Blanco': 'white', 'Negro': 'black', 'Gris': 'gray', 'Beige': 'beige', 'Camel': 'camel',
    'Marrón': 'brown', 'Azul marino': 'navy blue', 'Azul Eléctrico': 'blue', 'Celeste': 'light blue',
    'Rojo': 'red', 'Bordó': 'burgundy', 'Verde': 'green', 'Verde oliva': 'olive green',
    'Amarillo': 'yellow', 'Naranja': 'orange', 'Rosa pastel': 'pink', 'Lila': 'lilac',
    'Fucsia': 'fuchsia', 'Violeta': 'purple', 'Mostaza': 'mustard', 'Plateado': 'silver', 'Dorado': 'gold'
};

export const MoodBoard = () => {
    const [boardItems, setBoardItems] = useState<MoodBoardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<{ url: string; item?: ClothingItem; altText?: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const clothes = await storageService.getClothingItems();
            const outfits = await storageService.getOutfits();

            // Mapear prendas
            const mappedClothes: MoodBoardItem[] = clothes.map(c => ({
                type: 'clothing',
                data: c,
                aspect: aspectRatioClasses[Math.floor(Math.random() * aspectRatioClasses.length)]
            }));

            // Mapear outfits
            const mappedOutfits: MoodBoardItem[] = outfits.map(o => {
                const outfitItems = o.items
                    .map(id => clothes.find(c => c.id === id))
                    .filter((item): item is ClothingItem => !!item);

                return {
                    type: 'outfit',
                    data: o,
                    items: outfitItems,
                    // Outfits suelen verse bien en cuadrados o levemente rectangulares
                    aspect: ['aspect-square', 'aspect-[4/5]'][Math.floor(Math.random() * 2)]
                };
            });

            // Fetch Unsplash Inspirations based on specific items from the user's closet
            let unspashItems: MoodBoardItem[] = [];
            if (clothes.length > 0) {
                // Pick 2 random unique items the user owns
                const shuffledClothes = [...clothes].sort(() => 0.5 - Math.random());
                const clothesToSearch = shuffledClothes.slice(0, 2);

                const promises = clothesToSearch.map(item => {
                    const englishCat = categoryToEnglish[item.category] || 'clothing';
                    const mainColorEsp = item.colores && item.colores.length > 0 ? item.colores[0] : '';
                    const englishColor = colorToEnglish[mainColorEsp] || '';

                    const query = `${englishColor} ${englishCat}`.trim();

                    return unsplashService.getInspiration(query, `Inspirado en tu ${item.name}`, 3);
                });

                const results = await Promise.all(promises);
                const images = results.flat();

                unspashItems = images.map(img => ({
                    type: 'inspiration',
                    data: img,
                    aspect: ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[9/16]'][Math.floor(Math.random() * 3)]
                }));
            }

            // Mezclar todo
            const combined = [...mappedClothes, ...mappedOutfits, ...unspashItems].sort(() => Math.random() - 0.5);
            setBoardItems(combined);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title="MoodBoard"
                description="Tu tablero de inspiración. Una mezcla de tus prendas y outfits para visualizar tu estilo."
                icon={Layout}
            />

            <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-neutral-200/50 p-6 sm:p-8 min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-[zinc-900] border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
                    </div>
                ) : boardItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layout className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                            Tu MoodBoard está aspirando a la grandeza
                        </h3>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                            Sube fotos de tus prendas o crea outfits para que empiecen a aparecer aquí en tu tablero personal de inspiración.
                        </p>
                    </motion.div>
                ) : (
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        <AnimatePresence>
                            {boardItems.map((item, i) => (
                                <motion.div
                                    key={`${item.type}-${item.type === 'clothing' ? item.data.id : item.type === 'outfit' ? item.data.id : item.data.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, ease: 'easeOut', duration: 0.4 }}
                                    onClick={() => {
                                        if (item.type === 'clothing') {
                                            setSelectedImage({ url: item.data.imageUrl, item: item.data, altText: item.data.name });
                                        } else if (item.type === 'inspiration') {
                                            setSelectedImage({ url: item.data.url, altText: item.data.queryLabel });
                                            unsplashService.trackDownload(item.data.downloadLocation); // Trigger API requirement
                                        } else if (item.type === 'outfit' && item.data.imageUrl) {
                                            setSelectedImage({ url: item.data.imageUrl, altText: item.data.name });
                                        }
                                        // Si es un outfit sin imagen principal (solo collage), no abrimos modal
                                    }}
                                    className={`relative break-inside-avoid mb-4 group rounded-2xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${item.aspect}`}
                                >
                                    {item.type === 'clothing' ? (
                                        <>
                                            <img
                                                src={item.data.imageUrl}
                                                alt={item.data.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {item.data.isWishlist && (
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm z-10 transition-transform group-hover:scale-110">
                                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <p className="text-white font-semibold text-sm drop-shadow-md truncate">
                                                    {item.data.name}
                                                </p>
                                                <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                                                    <Shirt className="w-3 h-3" />
                                                    <span>Prenda</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : item.type === 'outfit' ? (
                                        <>
                                            {/* Outfit Collage */}
                                            <div className="absolute inset-0 p-2 sm:p-3">
                                                <div className="w-full h-full rounded-xl overflow-hidden bg-white shadow-inner">
                                                    {item.items.length === 0 ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                                            <Sparkles className="w-8 h-8 text-neutral-300" />
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-1 h-full p-1 bg-neutral-100">
                                                            {item.items.slice(0, 4).map((outfitItem, idx) => (
                                                                <div
                                                                    key={outfitItem.id}
                                                                    className={`rounded-lg overflow-hidden bg-white relative ${item.items.length === 1 ? 'col-span-2 row-span-2' : ''
                                                                        } ${item.items.length === 3 && idx === 0 ? 'col-span-2' : ''
                                                                        }`}
                                                                >
                                                                    <img
                                                                        src={outfitItem.imageUrl}
                                                                        alt="Outfit piece"
                                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                    />
                                                                </div>
                                                            ))}
                                                            {item.items.length > 4 && (
                                                                <div className="absolute bottom-2 right-2 bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-lg shadow-lg z-10">
                                                                    +{item.items.length - 4}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute inset-x-2 bottom-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl pointer-events-none" />
                                            <div className="absolute bottom-2 left-2 right-2 p-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                                <p className="text-white font-semibold text-sm drop-shadow-md truncate">
                                                    {item.data.name}
                                                </p>
                                                <div className="flex items-center gap-1 text-white/80 text-xs mt-1 tracking-wide">
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Outfit</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Inspiration Image */}
                                            <img
                                                src={item.data.url}
                                                alt="Inspiration"
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm z-10 transition-transform group-hover:scale-110">
                                                <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500/20" />
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <p className="text-white font-semibold text-sm drop-shadow-md truncate decoration-white/50">
                                                    {item.data.queryLabel}
                                                </p>
                                                <div className="flex flex-col mt-1">
                                                    <span className="text-[10px] text-white/60 flex items-center gap-1 w-max pointer-events-auto">
                                                        Foto por{' '}
                                                        <a
                                                            href={`${item.data.authorLink}?utm_source=chicas_guapas_ai&utm_medium=referral`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-white transition-colors hover:underline"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            {item.data.authorName}
                                                        </a>
                                                        {' '}en{' '}
                                                        <a
                                                            href={`https://unsplash.com/?utm_source=chicas_guapas_ai&utm_medium=referral`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-white transition-colors hover:underline"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            Unsplash
                                                        </a>
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage.url}
                    altText={selectedImage.altText}
                    item={selectedImage.item}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </motion.div>
    );
};
