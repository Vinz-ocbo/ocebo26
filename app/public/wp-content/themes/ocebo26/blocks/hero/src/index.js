import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import metadata from '../block.json';

const ArrowSVG = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
		<path
			d="M4 12L12 4M12 4H5M12 4V11"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const {
			sectionNumber,
			title,
			text,
			ctaPrimaryLabel,
			ctaPrimaryUrl,
			ctaSecondaryLabel,
			ctaSecondaryUrl,
		} = attributes;

		const blockProps = useBlockProps( { className: 'hero section' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title="Réglages section" initialOpen={ false }>
						<TextControl
							label="Numéro de section"
							value={ sectionNumber }
							onChange={ ( val ) =>
								setAttributes( { sectionNumber: val } )
							}
						/>
					</PanelBody>
					<PanelBody title="CTA Primaire" initialOpen={ true }>
						<TextControl
							label="URL du bouton primaire"
							value={ ctaPrimaryUrl }
							onChange={ ( val ) =>
								setAttributes( { ctaPrimaryUrl: val } )
							}
						/>
					</PanelBody>
					<PanelBody title="CTA Secondaire" initialOpen={ true }>
						<TextControl
							label="URL du bouton secondaire"
							value={ ctaSecondaryUrl }
							onChange={ ( val ) =>
								setAttributes( { ctaSecondaryUrl: val } )
							}
						/>
					</PanelBody>
				</InspectorControls>

				<section { ...blockProps } aria-labelledby="hero-title">
					<div className="hero__inner container">
						<div className="hero__content">
							<div className="section-header">
								<span
									className="section-number"
									aria-hidden="true"
								>
									{ sectionNumber }
								</span>
								<RichText
									tagName="h1"
									id="hero-title"
									className="hero__title display-xl"
									value={ title }
									onChange={ ( val ) =>
										setAttributes( { title: val } )
									}
									allowedFormats={ [
										'core/bold',
										'core/italic',
									] }
									placeholder="Titre du hero..."
								/>
							</div>
							<div className="hero__body">
								<RichText
									tagName="p"
									className="hero__text body-lg"
									value={ text }
									onChange={ ( val ) =>
										setAttributes( { text: val } )
									}
									placeholder="Texte d'accroche..."
								/>
								<div className="hero__ctas">
									<span className="btn btn--primary">
										<RichText
											tagName="span"
											value={ ctaPrimaryLabel }
											onChange={ ( val ) =>
												setAttributes( {
													ctaPrimaryLabel: val,
												} )
											}
											allowedFormats={ [] }
											placeholder="Label CTA primaire"
										/>
										<span
											className="btn__icon-right"
											aria-hidden="true"
										>
											<ArrowSVG />
										</span>
									</span>
									<span className="btn btn--secondary">
										<RichText
											tagName="span"
											value={ ctaSecondaryLabel }
											onChange={ ( val ) =>
												setAttributes( {
													ctaSecondaryLabel: val,
												} )
											}
											allowedFormats={ [] }
											placeholder="Label CTA secondaire"
										/>
										<span
											className="btn__icon-right btn__icon-right--accent"
											aria-hidden="true"
										>
											<ArrowSVG />
										</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>
			</>
		);
	},

	save() {
		return null;
	},
} );
