import { useState } from 'react';
import FadeInImage from './FadeInImage';
import { useLanguage } from '../context/LanguageContext';

const examples = ['example1', 'example2', 'example3'] as const;
const steps = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;
const processImages = {
  example1: [
    '/Process/Process1_Image1.jpg',
    '/Process/Process1_Image2.jpg',
    '/Process/Process1_Image3.jpg',
    '/Process/Process1_Image4.jpg',
    '/Process/Process1_Image5.jpg',
  ],
  example2: [
    '/Process/Process2_Image1.jpg',
    '/Process/Process2_Image2.jpg',
    '/Process/Process2_Image3.jpg',
    '/Process/Process2_Image4.jpg',
    '/Process/Process2_Image5.jpg',
  ],
  example3: [
    '/Process/Process3_Image1.jpg',
    '/Process/Process3_Image2.jpg',
    '/Process/Process3_Image3.jpg',
    '/Process/Process3_Image4.jpg',
    '/Process/Process3_Image5.jpg',
  ],
} as const;

interface Props {
  onOpenImage: (src: string, alt: string, title: string) => void;
}

export default function ProcessSteps({ onOpenImage }: Props) {
  const { t } = useLanguage();
  const [activeExample, setActiveExample] = useState<(typeof examples)[number]>('example1');

  return (
    <section className="mt-10 glass-panel p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gallery-gold">
            {t('about.processOverline')}
          </p>
          <h2 className="font-serif text-3xl text-white mt-2">{t('about.processTitle')}</h2>
          <p className="text-sm leading-7 text-slate-300 max-w-2xl mt-3">
            {t('about.processIntro')}
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-3">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setActiveExample(example)}
              className={`process-example-btn ${activeExample === example ? 'process-example-btn-active' : ''}`}
            >
              {t(`about.processExamples.${example}.label`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <article key={step} className="glass-card p-4">
            <button
              type="button"
              onClick={() =>
                onOpenImage(
                  processImages[activeExample][index],
                  `${t(`about.processExamples.${activeExample}.label`)} - ${t(`about.processExamples.${activeExample}.steps.${step}.title`)}`,
                  t(`about.processExamples.${activeExample}.steps.${step}.title`),
                )
              }
              className="group mb-4 block w-full cursor-zoom-in text-left"
              aria-label={`Open ${t(`about.processExamples.${activeExample}.steps.${step}.title`)}`}
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)] bg-white/5">
                <FadeInImage
                  src={processImages[activeExample][index]}
                  alt={`${t(`about.processExamples.${activeExample}.label`)} - ${t(`about.processExamples.${activeExample}.steps.${step}.title`)}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="process-step-index">{index + 1}</span>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gallery-gold">
                {t(`about.processExamples.${activeExample}.steps.${step}.title`)}
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              {t(`about.processExamples.${activeExample}.steps.${step}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
