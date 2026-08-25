<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * On PostgreSQL the real vector lives in the `vector` column (pgvector) and is
 * queried with raw SQL (<=> cosine distance). `vector_json` is the MySQL
 * fallback. See ARCHITECTURE.md → "Vector search".
 */
class Embedding extends Model
{
    use BelongsToOrganization;

    protected $guarded = ['id', 'organization_id'];

    protected function casts(): array
    {
        return [
            'vector_json' => 'array',
            'dimensions' => 'integer',
        ];
    }

    public function chunk(): BelongsTo
    {
        return $this->belongsTo(KnowledgeChunk::class, 'knowledge_chunk_id');
    }
}
