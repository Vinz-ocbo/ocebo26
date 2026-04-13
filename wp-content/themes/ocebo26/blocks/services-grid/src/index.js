import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, Button, TextControl } from '@wordpress/components';
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
		const { sectionNumber, title, cards } = attributes;

		const blockProps = useBlockProps( {
			className: 'section section--acces-direct',
		} );

		const updateCard = ( index, field, value ) => {
			const newCards = cards.map( ( card, i ) =>
				i === index ? { ...card, [ field ]: value } : card
			);
			setAttributes( { cards: newCards } );
		};

		const addCard = () => {
			setAttributes( {
				cards: [
					...cards,
					{ title: '', text: '', ctaLabel: '', ctaUrl: '#' },
				],
			} );
		};

		const removeCard = ( index ) => {
			const newCards = cards.filter( ( _, i ) => i !== index );
			setAttributes( { cards: newCards } );
		};

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
					<PanelBody title="Cartes" initialOpen={ true }>
						<Button
							variant="primary"
							onClick={ addCard }
							style={ { marginBottom: '12px' } }
						>
							Ajouter une carte
						</Button>
						{ cards.map( ( card, index ) => (
							<PanelBody
								key={ index }
								title={ `Carte ${ index + 1 }` }
								initialOpen={ false }
							>
								<TextControl
									label="URL du CTA"
									value={ card.ctaUrl }
									onChange={ ( val ) =>
										updateCard( index, 'ctaUrl', val )
									}
								/>
								<Button
									isDestructive
									variant="secondary"
									onClick={ () => removeCard( index ) }
								>
									Supprimer cette carte
								</Button>
							</PanelBody>
						) ) }
					</PanelBody>
				</InspectorControls>

				<section
					{ ...blockProps }
					aria-labelledby="bloc2-title"
				>
					<div className="container container--wide">
						<div className="section-header">
							<span
								className="section-number"
								aria-hidden="true"
							>
								{ sectionNumber }
							</span>
							<RichText
								tagName="h2"
								id="bloc2-title"
								className="display-lg"
								value={ title }
								onChange={ ( val ) =>
									setAttributes( { title: val } )
								}
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								placeholder="Titre de la section..."
							/>
						</div>
						<div className="acces-direct__grid">
							{ cards.map( ( card, index ) => (
								<div key={ index } className="card-service">
									<div className="card-service__header">
										<RichText
											tagName="h3"
											className="card-service__title heading-md"
											value={ card.title }
											onChange={ ( val ) =>
												updateCard(
													index,
													'title',
													val
												)
											}
											allowedFormats={ [
												'core/bold',
												'core/italic',
											] }
											placeholder="Titre de la carte..."
										/>
									</div>
									<hr
										className="card-service__separator"
										aria-hidden="true"
									/>
									<RichText
										tagName="p"
										className="card-service__text body-md"
										value={ card.text }
										onChange={ ( val ) =>
											updateCard( index, 'text', val )
										}
										allowedFormats={ [] }
										placeholder="Description..."
									/>
									<span className="card-service__cta">
										<RichText
											tagName="span"
											value={ card.ctaLabel }
											onChange={ ( val ) =>
												updateCard(
													index,
													'ctaLabel',
													val
												)
											}
											allowedFormats={ [] }
											placeholder="Label CTA..."
										/>
										<span
											className="card-service__cta-icon"
											aria-hidden="true"
										>
											<ArrowSVG />
										</span>
									</span>
								</div>
							) ) }
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
