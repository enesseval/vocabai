// Default vocabulary words categorized by user interests
// Each topic has 5 starter words to help users begin quizzing immediately

import { WordAnalysis } from '../types/story';

export type DefaultWord = Omit<WordAnalysis, 'sentence'> & {
    sentence: string; // Full example sentence
};

export const DEFAULT_VOCABULARY: Record<number, DefaultWord[]> = {
    // 1. Tech (Technology)
    1: [
        {
            word: 'algorithm',
            lemma: 'algorithm',
            translation: 'algoritma',
            explanation: 'A process or set of rules to be followed in calculations or problem-solving operations',
            sentence: 'The algorithm efficiently sorted the data in just a few seconds.',
            examples: ['sorting algorithm', 'search algorithm', 'encryption algorithm']
        },
        {
            word: 'interface',
            lemma: 'interface',
            translation: 'arayüz',
            explanation: 'A point where two systems or subjects meet and interact',
            sentence: 'The new user interface is much more intuitive and easy to navigate.',
            examples: ['user interface', 'graphical interface', 'programming interface']
        },
        {
            word: 'database',
            lemma: 'database',
            translation: 'veritabanı',
            explanation: 'A structured set of data held in a computer',
            sentence: 'All customer information is stored securely in the database.',
            examples: ['SQL database', 'cloud database', 'distributed database']
        },
        {
            word: 'encryption',
            lemma: 'encryption',
            translation: 'şifreleme',
            explanation: 'The process of converting information into a code to prevent unauthorized access',
            sentence: 'End-to-end encryption ensures that only you can read your messages.',
            examples: ['data encryption', 'encryption key', 'military-grade encryption']
        },
        {
            word: 'bandwidth',
            lemma: 'bandwidth',
            translation: 'bant genişliği',
            explanation: 'The maximum rate of data transfer across a network',
            sentence: 'You need high bandwidth to stream videos in 4K quality.',
            examples: ['network bandwidth', 'bandwidth limitation', 'available bandwidth']
        }
    ],

    // 2. Philosophy
    2: [
        {
            word: 'existential',
            lemma: 'existential',
            translation: 'varoluşsal',
            explanation: 'Relating to existence or the nature of being',
            sentence: 'The film explores existential questions about the meaning of life.',
            examples: ['existential crisis', 'existential philosophy', 'existential threat']
        },
        {
            word: 'ethics',
            lemma: 'ethics',
            translation: 'etik',
            explanation: 'Moral principles that govern behavior',
            sentence: 'Medical ethics require doctors to prioritize patient welfare.',
            examples: ['business ethics', 'code of ethics', 'ethical dilemma']
        },
        {
            word: 'consciousness',
            lemma: 'consciousness',
            translation: 'bilinç',
            explanation: 'The state of being aware of and responsive to one\'s surroundings',
            sentence: 'Philosophers debate whether artificial intelligence can develop consciousness.',
            examples: ['self-consciousness', 'stream of consciousness', 'conscious decision']
        },
        {
            word: 'paradox',
            lemma: 'paradox',
            translation: 'paradoks',
            explanation: 'A seemingly contradictory statement that may be true',
            sentence: 'The liar\'s paradox has puzzled philosophers for centuries.',
            examples: ['logical paradox', 'time paradox', 'paradoxical situation']
        },
        {
            word: 'metaphysics',
            lemma: 'metaphysics',
            translation: 'metafizik',
            explanation: 'The branch of philosophy dealing with the nature of reality',
            sentence: 'Metaphysics explores questions about time, space, and causality.',
            examples: ['metaphysical question', 'metaphysical realm', 'metaphysical debate']
        }
    ],

    // 3. Art
    3: [
        {
            word: 'aesthetic',
            lemma: 'aesthetic',
            translation: 'estetik',
            explanation: 'Concerned with beauty or the appreciation of beauty',
            sentence: 'The building has a minimalist aesthetic with clean lines and neutral colors.',
            examples: ['aesthetic value', 'aesthetic appeal', 'aesthetic principles']
        },
        {
            word: 'composition',
            lemma: 'composition',
            translation: 'kompozisyon',
            explanation: 'The arrangement of elements in a work of art',
            sentence: 'The artist used triangular composition to create visual balance.',
            examples: ['musical composition', 'photographic composition', 'compositional technique']
        },
        {
            word: 'perspective',
            lemma: 'perspective',
            translation: 'perspektif',
            explanation: 'The technique of representing three-dimensional objects on a flat surface',
            sentence: 'Renaissance painters mastered linear perspective to create depth.',
            examples: ['one-point perspective', 'aerial perspective', 'forced perspective']
        },
        {
            word: 'palette',
            lemma: 'palette',
            translation: 'palet',
            explanation: 'The range of colors used by an artist',
            sentence: 'The painter chose a warm palette of reds, oranges, and yellows.',
            examples: ['color palette', 'earthy palette', 'limited palette']
        },
        {
            word: 'surrealism',
            lemma: 'surrealism',
            translation: 'sürrealizm',
            explanation: 'An art movement featuring bizarre, dreamlike imagery',
            sentence: 'Salvador Dalí was a prominent figure in the surrealism movement.',
            examples: ['surrealist painting', 'surrealist imagery', 'surrealist technique']
        }
    ],

    // 4. Business
    4: [
        {
            word: 'revenue',
            lemma: 'revenue',
            translation: 'gelir',
            explanation: 'Income generated from business operations',
            sentence: 'The company\'s revenue increased by 25% this quarter.',
            examples: ['annual revenue', 'revenue stream', 'revenue growth']
        },
        {
            word: 'stakeholder',
            lemma: 'stakeholder',
            translation: 'paydaş',
            explanation: 'A person or group with an interest in a business',
            sentence: 'We need to consider all stakeholder opinions before making this decision.',
            examples: ['key stakeholder', 'stakeholder meeting', 'stakeholder engagement']
        },
        {
            word: 'leverage',
            lemma: 'leverage',
            translation: 'kaldıraç',
            explanation: 'To use something to maximum advantage',
            sentence: 'The startup leveraged social media to reach millions of potential customers.',
            examples: ['financial leverage', 'leverage assets', 'leverage expertise']
        },
        {
            word: 'scalability',
            lemma: 'scalability',
            translation: 'ölçeklenebilirlik',
            explanation: 'The ability to grow and manage increased demand',
            sentence: 'Cloud services offer excellent scalability for growing businesses.',
            examples: ['business scalability', 'scalable solution', 'scalability challenges']
        },
        {
            word: 'diversification',
            lemma: 'diversification',
            translation: 'çeşitlendirme',
            explanation: 'The process of varying products or investments to reduce risk',
            sentence: 'Portfolio diversification helps protect against market volatility.',
            examples: ['product diversification', 'diversification strategy', 'risk diversification']
        }
    ],

    // 5. Nature
    5: [
        {
            word: 'ecosystem',
            lemma: 'ecosystem',
            translation: 'ekosistem',
            explanation: 'A biological community of interacting organisms and their environment',
            sentence: 'The rainforest ecosystem supports incredible biodiversity.',
            examples: ['marine ecosystem', 'fragile ecosystem', 'ecosystem balance']
        },
        {
            word: 'biodiversity',
            lemma: 'biodiversity',
            translation: 'biyoçeşitlilik',
            explanation: 'The variety of plant and animal life in a habitat',
            sentence: 'Coral reefs have some of the highest biodiversity on Earth.',
            examples: ['biodiversity loss', 'protect biodiversity', 'biodiversity hotspot']
        },
        {
            word: 'photosynthesis',
            lemma: 'photosynthesis',
            translation: 'fotosentez',
            explanation: 'The process by which plants convert light into energy',
            sentence: 'Through photosynthesis, plants produce oxygen and absorb carbon dioxide.',
            examples: ['photosynthesis process', 'photosynthetic organisms', 'rate of photosynthesis']
        },
        {
            word: 'migration',
            lemma: 'migration',
            translation: 'göç',
            explanation: 'Seasonal movement of animals from one region to another',
            sentence: 'Monarch butterflies undertake an incredible migration spanning thousands of miles.',
            examples: ['bird migration', 'migration pattern', 'annual migration']
        },
        {
            word: 'conservation',
            lemma: 'conservation',
            translation: 'koruma',
            explanation: 'The protection of plants, animals, and natural resources',
            sentence: 'Wildlife conservation efforts have saved several endangered species.',
            examples: ['conservation project', 'environmental conservation', 'conservation status']
        }
    ],

    // 6. Science
    6: [
        {
            word: 'hypothesis',
            lemma: 'hypothesis',
            translation: 'hipotez',
            explanation: 'A proposed explanation for a phenomenon, to be tested',
            sentence: 'Scientists tested the hypothesis through controlled experiments.',
            examples: ['scientific hypothesis', 'test hypothesis', 'hypothesis validation']
        },
        {
            word: 'molecule',
            lemma: 'molecule',
            translation: 'molekül',
            explanation: 'A group of atoms bonded together',
            sentence: 'Water molecules consist of two hydrogen atoms and one oxygen atom.',
            examples: ['organic molecule', 'molecular structure', 'molecule formation']
        },
        {
            word: 'quantum',
            lemma: 'quantum',
            translation: 'kuantum',
            explanation: 'The smallest possible discrete unit of any physical property',
            sentence: 'Quantum mechanics describes the behavior of matter at atomic scales.',
            examples: ['quantum physics', 'quantum leap', 'quantum computer']
        },
        {
            word: 'catalyst',
            lemma: 'catalyst',
            translation: 'katalizör',
            explanation: 'A substance that increases the rate of a chemical reaction',
            sentence: 'Enzymes act as biological catalysts in many metabolic processes.',
            examples: ['chemical catalyst', 'catalyst reaction', 'catalytic converter']
        },
        {
            word: 'equilibrium',
            lemma: 'equilibrium',
            translation: 'denge',
            explanation: 'A state of balance between opposing forces',
            sentence: 'The chemical reaction reached equilibrium after several hours.',
            examples: ['thermal equilibrium', 'equilibrium state', 'disturb equilibrium']
        }
    ],

    // 7. Literature
    7: [
        {
            word: 'metaphor',
            lemma: 'metaphor',
            translation: 'metafor',
            explanation: 'A figure of speech comparing two unlike things without using "like" or "as"',
            sentence: 'The author used the metaphor of a journey to represent life itself.',
            examples: ['extended metaphor', 'mixed metaphor', 'metaphorical language']
        },
        {
            word: 'protagonist',
            lemma: 'protagonist',
            translation: 'baş karakter',
            explanation: 'The main character in a story',
            sentence: 'The novel\'s protagonist faces numerous challenges throughout the narrative.',
            examples: ['heroic protagonist', 'protagonist journey', 'protagonist development']
        },
        {
            word: 'narrative',
            lemma: 'narrative',
            translation: 'anlatı',
            explanation: 'A spoken or written account of connected events',
            sentence: 'The film uses a non-linear narrative structure.',
            examples: ['narrative voice', 'narrative technique', 'personal narrative']
        },
        {
            word: 'allegory',
            lemma: 'allegory',
            translation: 'alegori',
            explanation: 'A story with a hidden moral or political meaning',
            sentence: 'Animal Farm is an allegory about totalitarian regimes.',
            examples: ['political allegory', 'allegorical meaning', 'allegorical novel']
        },
        {
            word: 'foreshadowing',
            lemma: 'foreshadowing',
            translation: 'önceden ipucu verme',
            explanation: 'Hints about future events in a story',
            sentence: 'The dark clouds in the opening scene were foreshadowing the tragedy to come.',
            examples: ['subtle foreshadowing', 'foreshadowing technique', 'dramatic foreshadowing']
        }
    ],

    // 8. History
    8: [
        {
            word: 'civilization',
            lemma: 'civilization',
            translation: 'uygarlık',
            explanation: 'An advanced stage of human social development',
            sentence: 'Ancient Egyptian civilization flourished along the Nile River.',
            examples: ['ancient civilization', 'western civilization', 'civilization collapse']
        },
        {
            word: 'dynasty',
            lemma: 'dynasty',
            translation: 'hanedan',
            explanation: 'A succession of rulers from the same family',
            sentence: 'The Ming dynasty ruled China for nearly three centuries.',
            examples: ['royal dynasty', 'dynasty period', 'dynasty founder']
        },
        {
            word: 'revolution',
            lemma: 'revolution',
            translation: 'devrim',
            explanation: 'A fundamental change in political organization or social structure',
            sentence: 'The Industrial Revolution transformed manufacturing and society.',
            examples: ['French Revolution', 'revolutionary change', 'revolution timeline']
        },
        {
            word: 'archaeology',
            lemma: 'archaeology',
            translation: 'arkeoloji',
            explanation: 'The study of human history through excavation of artifacts',
            sentence: 'Archaeology reveals fascinating details about ancient cultures.',
            examples: ['archaeological site', 'archaeology discovery', 'archaeological evidence']
        },
        {
            word: 'empire',
            lemma: 'empire',
            translation: 'imparatorluk',
            explanation: 'An extensive group of states ruled by a single authority',
            sentence: 'The Roman Empire controlled vast territories across Europe and beyond.',
            examples: ['ancient empire', 'empire expansion', 'empire decline']
        }
    ],

    // 9. Cinema
    9: [
        {
            word: 'cinematography',
            lemma: 'cinematography',
            translation: 'sinematografi',
            explanation: 'The art of photography and camerawork in filmmaking',
            sentence: 'The film won an award for its breathtaking cinematography.',
            examples: ['digital cinematography', 'cinematography technique', 'director of cinematography']
        },
        {
            word: 'montage',
            lemma: 'montage',
            translation: 'montaj',
            explanation: 'A technique of editing sequences of short shots together',
            sentence: 'The training montage showed the character\'s progress over several months.',
            examples: ['montage sequence', 'montage effect', 'montage editing']
        },
        {
            word: 'screenplay',
            lemma: 'screenplay',
            translation: 'senaryo',
            explanation: 'The script of a film including dialogue and stage directions',
            sentence: 'The screenplay was adapted from a bestselling novel.',
            examples: ['screenplay writer', 'original screenplay', 'screenplay adaptation']
        },
        {
            word: 'genre',
            lemma: 'genre',
            translation: 'tür',
            explanation: 'A category of artistic composition characterized by style or content',
            sentence: 'Science fiction is my favorite film genre.',
            examples: ['horror genre', 'genre convention', 'cross-genre']
        },
        {
            word: 'protagonist',
            lemma: 'protagonist',
            translation: 'başrol',
            explanation: 'The leading character in a film',
            sentence: 'The film\'s protagonist embarks on a journey of self-discovery.',
            examples: ['heroic protagonist', 'protagonist arc', 'protagonist motivation']
        }
    ],

    // 10. Travel
    10: [
        {
            word: 'itinerary',
            lemma: 'itinerary',
            translation: 'seyahat programı',
            explanation: 'A planned route or journey',
            sentence: 'Our travel itinerary includes visits to five European cities.',
            examples: ['detailed itinerary', 'flexible itinerary', 'itinerary planning']
        },
        {
            word: 'landmark',
            lemma: 'landmark',
            translation: 'anıt',
            explanation: 'A recognizable feature used for navigation or as a point of interest',
            sentence: 'The Eiffel Tower is Paris\'s most famous landmark.',
            examples: ['historic landmark', 'natural landmark', 'landmark attraction']
        },
        {
            word: 'expedition',
            lemma: 'expedition',
            translation: 'keşif gezisi',
            explanation: 'A journey undertaken by a group for exploration',
            sentence: 'The expedition to Antarctica lasted three months.',
            examples: ['scientific expedition', 'mountain expedition', 'expedition team']
        },
        {
            word: 'cuisine',
            lemma: 'cuisine',
            translation: 'mutfak',
            explanation: 'A style of cooking characteristic of a particular region',
            sentence: 'Italian cuisine is renowned for its pasta and pizza dishes.',
            examples: ['local cuisine', 'authentic cuisine', 'fusion cuisine']
        },
        {
            word: 'accommodation',
            lemma: 'accommodation',
            translation: 'konaklama',
            explanation: 'A place where travelers can stay',
            sentence: 'We booked accommodation near the beach for our vacation.',
            examples: ['hotel accommodation', 'budget accommodation', 'accommodation booking']
        }
    ],
};

// Helper function to get default words based on user's selected interests
export function getDefaultWordsForInterests(interestIds: number[]): DefaultWord[] {
    if (interestIds.length === 0) {
        // If no interests selected, return words from first topic (tech) as fallback
        return DEFAULT_VOCABULARY[1] || [];
    }

    // Get first interest's words (5 words)
    const primaryInterest = interestIds[0];
    return DEFAULT_VOCABULARY[primaryInterest] || DEFAULT_VOCABULARY[1] || [];
}
