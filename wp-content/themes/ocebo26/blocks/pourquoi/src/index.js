import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, Button, TextControl } from '@wordpress/components';
import metadata from '../block.json';

const ArrowSVG = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path
			d="M4 12L12 4M12 4H5M12 4V11"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// Backward-compat: items used to be {title, text}; ensure ctaUrl exists.
const normalizeItems = ( items ) =>
	( items || [] ).map( ( it ) => ( {
		title: it?.title ?? '',
		text: it?.text ?? '',
		ctaUrl: it?.ctaUrl ?? '',
	} ) );

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { sectionNumber, title } = attributes;
		const items = normalizeItems( attributes.items );

		const blockProps = useBlockProps( {
			className: 'section section--pourquoi',
		} );

		const updateItem = ( index, field, value ) => {
			const newItems = items.map( ( item, i ) =>
				i === index ? { ...item, [ field ]: value } : item
			);
			setAttributes( { items: newItems } );
		};

		const addItem = () => {
			setAttributes( {
				items: [ ...items, { title: '', text: '', ctaUrl: '' } ],
			} );
		};

		const removeItem = ( index ) => {
			setAttributes( {
				items: items.filter( ( _, i ) => i !== index ),
			} );
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
					<PanelBody title="Items + CTA" initialOpen={ true }>
						<Button
							variant="primary"
							onClick={ addItem }
							style={ { marginBottom: '12px' } }
						>
							Ajouter un item
						</Button>
						{ items.map( ( item, index ) => (
							<div
								key={ index }
								style={ {
									borderTop: '1px solid #ddd',
									paddingTop: '8px',
									marginTop: '8px',
								} }
							>
								<div
									style={ {
										display: 'flex',
										alignItems: 'center',
										marginBottom: '4px',
									} }
								>
									<strong style={ { flex: 1 } }>
										Item { index + 1 }
									</strong>
									<Button
										isDestructive
										variant="tertiary"
										onClick={ () => removeItem( index ) }
									>
										Supprimer
									</Button>
								</div>
								<TextControl
									label="URL du CTA (vide = pas de bouton)"
									value={ item.ctaUrl }
									onChange={ ( val ) =>
										updateItem( index, 'ctaUrl', val )
									}
								/>
							</div>
						) ) }
					</PanelBody>
				</InspectorControls>

				<section
					{ ...blockProps }
					aria-labelledby="bloc3-title"
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
								id="bloc3-title"
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
						<div className="pourquoi__list">
							{ items.map( ( item, index ) => (
								<article
									key={ index }
									className="pourquoi__item"
								>
									<RichText
										tagName="h3"
										className="pourquoi__title heading-md"
										value={ item.title }
										onChange={ ( val ) =>
											updateItem(
												index,
												'title',
												val
											)
										}
										allowedFormats={ [
											'core/bold',
											'core/italic',
										] }
										placeholder="Titre..."
									/>
									<span
										className="pourquoi__divider"
										aria-hidden="true"
									></span>
									<RichText
										tagName="p"
										className="pourquoi__text body-md"
										value={ item.text }
										onChange={ ( val ) =>
											updateItem(
												index,
												'text',
												val
											)
										}
										allowedFormats={ [] }
										placeholder="Texte..."
									/>
									{ item.ctaUrl && (
										<span
											className="pourquoi__cta"
											aria-hidden="true"
										>
											<ArrowSVG />
										</span>
									) }
								</article>
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
